import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string

    @Exclude({ toPlainOnly: true })
    @Column()
    password?: string;

    @Column({ default: true })
    isActive: boolean;
}