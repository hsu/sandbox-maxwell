# Write your code here :-)

import pgzrun
from random import randint

WIDTH = 900
HEIGHT = 900

score = 0

game_over = False

ship = Actor("ship")
ship.pos = 100, 100

star = Actor("star")
star.pos = 200, 200

meteor = Actor("meteor")
meteor.pos = 250, 250

laser = Actor("laser")
laser.pos = 350, 350

def draw():
    screen.fill("black")
    ship.draw()
    star.draw()
    meteor.draw()
    laser.draw()
    screen.draw.text("Score: " + str(score), color="white", topleft=(10, 10))

    if game_over:
        screen.fill("blue")
        screen.draw.text("Final Score: " + str(score), topleft=(10, 10), fontsize = 50)

def place_star():
    star.x = randint(20, (WIDTH - 20))
    star.y = randint(20, (HEIGHT - 20))

def place_laser():
    laser.x = randint(20, (WIDTH - 20))
    laser.y = randint(20, (HEIGHT - 20))

def place_meteor():
    meteor.x = randint(20, (WIDTH - 20))
    meteor.y = randint(20, (HEIGHT - 20))

def time_up():
    global game_over
    game_over = True

def update():
    global score

    if keyboard.left:
        ship.x = ship.x - 5
    elif keyboard.right:
       ship.x = ship.x  +5
    elif keyboard.up:
       ship.y = ship.y  - 5
    elif keyboard.down:
       ship.y = ship.y  + 5

    star_collected = ship.colliderect(star)

    if star_collected:
        score +=5
        place_star()

    meteor_collided = ship.colliderect(meteor)

    if meteor_collided:
        score -=2
        place_meteor()

    laser_collided = ship.colliderect(laser)

    if laser_collided:
        score -=1
        place_laser()

clock.schedule(time_up, 60.120)

pgzrun.go
