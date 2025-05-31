import { userService } from "@/lib/services/user-service";

async function createUser() {
  try {
    const newUser = {
      email: "admin@gmail.com",
      username: "admin",
      password: "adminadmin",
      displayName: "Administrator",
      role: "admin",
      isActive: true,
    }
    const createdUser = await userService.create(newUser)
    console.log("User created:", createdUser);
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
}

createUser();