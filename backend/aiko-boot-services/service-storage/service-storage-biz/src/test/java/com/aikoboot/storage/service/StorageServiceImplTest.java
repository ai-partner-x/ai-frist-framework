package com.aikoboot.storage.service;

import com.aikoboot.core.exception.BizException;
import com.aikoboot.storage.api.dto.FileRecordDTO;
import com.aikoboot.storage.api.dto.PresignedUrlDTO;
import com.aikoboot.storage.config.StorageProperties;
import com.aikoboot.storage.entity.FileRecord;
import com.aikoboot.storage.mapper.FileRecordMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StorageServiceImplTest {

    private FileRecordMapper fileRecordMapper;
    private S3Client s3Client;
    private S3Presigner s3Presigner;
    private StorageProperties storageProperties;
    private StorageServiceImpl service;

    @BeforeEach
    void setUp() {
        fileRecordMapper = mock(FileRecordMapper.class);
        s3Client = mock(S3Client.class);
        s3Presigner = mock(S3Presigner.class);
        storageProperties = new StorageProperties();
        storageProperties.setBucket("test-bucket");
        service = new StorageServiceImpl(fileRecordMapper, s3Client, s3Presigner, storageProperties);
    }

    @Test
    void upload_buildsDateBasedKeyAndPersistsRecord() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", "fake-bytes".getBytes());

        FileRecordDTO dto = service.upload(file, "avatars");

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));

        // 关键断言：key 里包含 folder/日期路径/扩展名，且和最终持久化的 FileRecord 用的是同一个 id
        assertThat(dto.getStorageKey()).startsWith("avatars/" + today + "/");
        assertThat(dto.getStorageKey()).endsWith(".png");
        assertThat(dto.getOriginalFilename()).isEqualTo("avatar.png");
        assertThat(dto.getContentType()).isEqualTo("image/png");

        ArgumentCaptor<FileRecord> captor = ArgumentCaptor.forClass(FileRecord.class);
        verify(fileRecordMapper, times(1)).insert(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(dto.getId());
        assertThat(captor.getValue().getStorageKey()).isEqualTo(dto.getStorageKey());

        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(software.amazon.awssdk.core.sync.RequestBody.class));
    }

    @Test
    void upload_whenFilenameHasNoExtension_omitsDotSuffix() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "no-extension-file", "text/plain", "data".getBytes());

        FileRecordDTO dto = service.upload(file, "docs");

        assertThat(dto.getStorageKey()).doesNotContain(".");
    }

    @Test
    void download_whenRecordMissing_throwsBizExceptionWithFileNotFoundCode() {
        when(fileRecordMapper.selectById(999L)).thenReturn(null);

        // 关键断言：改用 BizException + StorageErrorCode 后，客户端能拿到明确的 404，
        // 不再是被 GlobalExceptionHandler 兜底成语义不明的 500。
        assertThatThrownBy(() -> service.download(999L))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(404);

        // download() 实际调用的是 getObjectAsBytes，不是 getObject(request, transformer) 那个重载——
        // 验证方法必须和被测代码真正调用的方法一致，否则这条断言对"改坏 download 逻辑"毫无防护力。
        verify(s3Client, times(0)).getObjectAsBytes(any(GetObjectRequest.class));
    }

    @Test
    void getPresignedUrl_whenRecordMissing_throwsBizExceptionWithFileNotFoundCode() {
        when(fileRecordMapper.selectById(999L)).thenReturn(null);

        assertThatThrownBy(() -> service.getPresignedUrl(999L, 3600))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(404);

        verify(s3Presigner, times(0)).presignGetObject(any(GetObjectPresignRequest.class));
    }

    @Test
    void getPresignedUrl_returnsUrlFromPresigner() throws Exception {
        FileRecord record = new FileRecord();
        record.setId(1L);
        record.setBucket("test-bucket");
        record.setStorageKey("avatars/2026/07/10/1.png");
        when(fileRecordMapper.selectById(1L)).thenReturn(record);

        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        when(presignedRequest.url()).thenReturn(URI.create("http://localhost:9000/test-bucket/avatars/2026/07/10/1.png?signature=abc").toURL());
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedRequest);

        PresignedUrlDTO dto = service.getPresignedUrl(1L, 3600);

        assertThat(dto.getUrl()).contains("test-bucket");
        assertThat(dto.getExpiresAt()).isNotNull();
    }

    @Test
    void delete_whenRecordExists_deletesFromS3AndDatabase() {
        FileRecord record = new FileRecord();
        record.setId(1L);
        record.setBucket("test-bucket");
        record.setStorageKey("avatars/2026/07/10/1.png");
        when(fileRecordMapper.selectById(1L)).thenReturn(record);

        service.delete(1L);

        verify(s3Client, times(1)).deleteObject(any(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.class));
        verify(fileRecordMapper, times(1)).deleteById(1L);
    }

    @Test
    void delete_whenRecordAlreadyGone_isIdempotentNoOp() {
        when(fileRecordMapper.selectById(999L)).thenReturn(null);

        service.delete(999L);

        verify(s3Client, times(0)).deleteObject(any(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.class));
        verify(fileRecordMapper, times(0)).deleteById(any());
    }
}
