import time


print("Please enter your username and password")
USERNAME = "Maxwell"
password = 331424


username_input = input("USERNAME: ")
password_input = input("password: ")


def login_system():

    if "username" == username_input and password == password_input:
        print("Logging In...")
        time.sleep(3)
        print("Access Granted")
    elif "username" == username_input and password != password_input:
        print("Incorrect Password! Try again")
    elif "username" != username_input and password == password_input:
        print("Incorrect Username")
    elif "username" != username_input and password != password_input:
        print("Incorrect Username or Password")
    elif "username" != username_input and password != password_input:
        print("This username is already taken! Contact support")
    else:
        print("Please, contact support")

