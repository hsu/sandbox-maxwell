import pgzrun
from random import randint

WIDTH = 400
HEIGHT = 350

alien = Actor("42fa354a-de96-49c6-a4f7-436e2f166214-SpaceX_Starship_launch_crash_10")


def draw():
    screen.clear()
    alien.draw()


def place_alien():
    alien.x = randint(10, 450)
    alien.y = randint(10, 350)


def on_mouse_down(pos):
    if alien.collidepoint(pos):
        print("starship zapped!!!")
        place_alien()
    else:
        print("you got zapped hahaha")
        quit()


place_alien()

pgzrun.go()
