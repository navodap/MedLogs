import bcrypt

password = "Admin@123"

hashed_password = bcrypt.hashpw(
    password.encode("utf-8"),
    bcrypt.gensalt()
)

print(
    hashed_password.decode("utf-8")
)