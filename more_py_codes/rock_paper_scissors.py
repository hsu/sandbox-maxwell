#!/usr/bin/env python3
import random

player = input("What is your choice? ")
print(player)

computer = random.choice(["rock", "paper", "scissors"])

print(computer)

if player == computer:
    print("it is a tie")
elif player == "rock" and computer == "scissors":
    print("you win")
elif player == "scissors" and computer == "paper":
    print("you win")
elif player == "paper" and computer == "rock":
    print("you win")
else:
    print("you lose")
