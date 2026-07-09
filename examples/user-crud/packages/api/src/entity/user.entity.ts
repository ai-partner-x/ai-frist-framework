import { Entity, TableId, TableField } from '@ai-partner-x/aiko-boot-starter-orm';

@Entity({ tableName: 'sys_user' })
export class User {
  @TableId({ type: 'AUTO' })
  id!: number;

  @TableField({ column: 'user_name' })
  username!: string;

  @TableField()
  email!: string;

  @TableField()
  age?: number;

  // SQLite/Kysely 返回的是 TEXT 列的原始字符串，而非 Date 实例，
  // better-sqlite3 也无法直接绑定 Date 对象，故此处类型为 string（ISO 字符串）
  @TableField({ column: 'created_at' })
  createdAt?: string;

  @TableField({ column: 'updated_at' })
  updatedAt?: string;
}
