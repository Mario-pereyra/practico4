import { IsEmail, IsString, Length } from 'class-validator';

export class LoginRequest {
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
