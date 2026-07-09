package com.aikoboot.web.filter;

import com.aikoboot.core.context.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;

class TenantContextFilterTest {

    private final TenantContextFilter filter = new TenantContextFilter();

    @Test
    void doFilterInternal_setsDefaultTenantBeforeChainAndClearsAfter() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        try (MockedStatic<TenantContext> mockedContext = mockStatic(TenantContext.class)) {
            filter.doFilterInternal(request, response, chain);

            mockedContext.verify(() -> TenantContext.setTenantId("default"));
            verify(chain).doFilter(request, response);
            mockedContext.verify(TenantContext::clear);
        }
    }

    @Test
    void doFilterInternal_clearsTenantContextEvenWhenChainThrows() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        doThrow(new RuntimeException("boom")).when(chain).doFilter(request, response);

        try (MockedStatic<TenantContext> mockedContext = mockStatic(TenantContext.class)) {
            assertThatThrownBy(() -> filter.doFilterInternal(request, response, chain))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("boom");

            mockedContext.verify(() -> TenantContext.setTenantId("default"));
            mockedContext.verify(TenantContext::clear);
        }
    }
}
