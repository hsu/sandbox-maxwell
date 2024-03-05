import pgzrun
from random import randint

WIDTH = 400
HEIGHT = 350

alien = Actor("alien")

def draw():
    screen.clear()
    alien.draw()


def place_alien():
    alien.x = randint(10, 400)
    alien.y = randint(10, 350)


def on_mouse_down(pos):
    if alien.collidepoint(pos):
        print("Good Job")
        place_alien()
    else:
        print("Game over")
        quit()

place_alien()

pgzrun.go()
