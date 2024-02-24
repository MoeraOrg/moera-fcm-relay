import { AllowNull, Column, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

@Table
export class Client extends Model {

    @PrimaryKey
    @Default(DataTypes.UUIDV4)
    @Column(DataTypes.UUID)
    declare id: string;

    @Unique
    @AllowNull(false)
    @Column
    declare clientId: string;

    @AllowNull(false)
    @Column
    declare nodeName: string;

    @Column(DataTypes.STRING)
    declare lang?: string | null;

    @AllowNull(false)
    @Column
    declare createdAt: Date;

}
