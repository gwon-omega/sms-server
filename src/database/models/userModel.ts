import { Table, Column,Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "users",
  modelName: "User",
  timestamps: true,
})

class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
  })
  declare userName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
   declare password: string;

  @Column({
    type: DataType.ENUM("admin", "institute", "super-admin", "student", "teacher"),
    defaultValue: "student",
  })
  declare role: string;

   @Column({
        type : DataType.STRING
    })
    declare currentInstituteNumber : string
}


export default User;
