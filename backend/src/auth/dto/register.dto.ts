import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterRequest {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  name: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @Length(1, 254, {
    message: 'El correo electrónico no debe exceder 254 caracteres',
  })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(8, 72, {
    message: 'La contraseña debe tener entre 8 y 72 caracteres',
  })
  password: string;
}
