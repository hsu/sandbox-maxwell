‹# Write your code here :-)

import pgzrun
from random import randint

WIDTH = 100
HEIGHT = 100
game_over  =    False
score = 0.1
def draw():
    screen.fill("Green")

    screen.draw.text("Score: " + str(score), color="white", topleft=(10, 10))

    if game_over:
        screen.fill("blue")
        screen.draw.text("Final Score: " + str(score), topleft=(10, 10), fontsize = 50)





def time_up():
    global game_over
    game_over = True

def update():
    global score










clock.schedule(time_up, 60.120)

pgzrun.go
