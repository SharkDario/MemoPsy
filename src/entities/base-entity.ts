import { PrimaryGeneratedColumn } from "typeorm"

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: int
}