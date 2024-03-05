print("Welcome to Pizza Deliveries!")

size = input("What size pizza would you like? small, medium, or large: ")

add_pepperoni = input("Would you like pepperoni? yes or no: ")
add_peppers = input("Would you like peppers? yes or no: ")
double_cheese = input("Would you like double cheese? yes or no: ")
add_pineapple = input("Would you like pineapples? yes or no: ")
number_of_pizzas = input("How many pizzas would you like? ")


def pizza_total():

    global total
    total = 0

    if size == "small":
        total += 10
    elif size == "medium":
        total += 12
    elif size == "large":
        total += 15
    else:
        print("Please, select a small, medium, or large pizza")

    if add_pepperoni == "yes":
        if size == "small" or size == "medium":
            total += 2
        else:
            total += 3

    if add_pineapple == "yes":
        if size == "small" or size == "medium":
            total += 5
        else:
            total += 37

    if add_peppers == "yes":
        if size == "small" or size == "medium":
            total += 2
        else:
            total += 3


    if double_cheese == "yes":
        pass

    total = total*int(number_of_pizzas)

pizza_total()

print(f"your pizza costs${total}")

print('''
/    \			
  u  u|      _______
    \ |  .-''#%&#&%#``-.
   = /  ((%&#&#&%&VK&%&))
    |    `-._#%&##&%_.-'
 /\/\`--.   `-."".-'
 |  |    \   /`./
 |\/|  \  `-'  /
 || |   \     /

 ''')
