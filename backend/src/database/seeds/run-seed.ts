import { AppDataSource } from '../data-source';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function run() {
  console.log('Initializing database seed...');
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const adminEmail = 'admin@cinema.com';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = userRepository.create({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepository.save(adminUser);
    console.log(`Admin user created successfully: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await AppDataSource.destroy();
  console.log('Seed execution finished.');
}

run().catch((err) => {
  console.error('Error running seed:', err);
  process.exit(1);
});
