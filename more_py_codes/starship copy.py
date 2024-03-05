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

xdir = 5

ydir = 5

meteor = Actor("meteor")
meteor.pos = 250, 250

laser = Actor("laser")
laser.pos = 350, 350

fireball = Actor("fireball")
fireball.pos = 400  , 400


def draw():
    screen.fill("Green")
    ship.draw()
    star.draw()
    meteor.draw()
    laser.draw()
    fireball.draw()
    screen.draw.text("Score: " + str(score), color="white", topleft=(10, 10))

    if game_over:
        screen.fill("blue")
        screen.draw.text("Final Score: " + str(score), topleft=(10, 10), fontsize = 50)

def place_star():
    star.x = star.x + randint(0, xdir)
    star.y = star.y + randint(0, ydir)

    if star.x >= WIDTH:
        star.x = 0

    if star.y >= HEIGHT:
        star.y = 0

def place_star2():
    star.x = randint(20, (WIDTH - 20))
    star.y = randint(20, (HEIGHT - 20))

def place_fireball2():
    fireball.x = randint(20, (WIDTH - 20))
    fireball.y = randint(20, (HEIGHT - 20))

def place_fireball():
    fireball.x = fireball.x + 2*randint(-xdir,0 )
    fireball.y = fireball.y + 2*randint(0, ydir)

    if fireball.x <= 0:
        fireball.x = WIDTH

    if fireball.y >= HEIGHT:
        fireball.y = 0

def place_laser():
    #laser.x = laser.x + 2*randint(-xdir,0 )
    laser.y = laser.y + 2*randint(0, ydir)

    if laser.x <= 0:
        laser.x = WIDTH

    if laser.y >= HEIGHT:
        laser.y = 0


def place_laser2():
    laser.x = randint(20, (WIDTH - 20))
    laser.y = randint(20, (HEIGHT - 20))

def place_meteor2():
    meteor.x = randint(20, (WIDTH - 20))
    meteor.y = randint(20, (HEIGHT - 20))

def place_meteor():
    meteor.x = meteor.x + 2*randint(-xdir,0 )
    meteor.y = meteor.y + 2*randint(0, ydir)

    if meteor.x <= 0:
        meteor.x = WIDTH

    if meteor.y >= HEIGHT:
        meteor.y = 0


def time_up():
    global game_over
    game_over = True

def update():
    global score

    if keyboard.left:
        ship.x = ship.x - 10
    elif keyboard.right:
       ship.x = ship.x  + 10
    elif keyboard.up:
       ship.y = ship.y  - 10
    elif keyboard.down:
       ship.y = ship.y  + 10

    if ship.x < 0:
        ship.x = 0
    elif ship.x >   WIDTH:
        ship.x = WIDTH

    if ship.y < 0:
        ship.y = HEIGHT
    elif ship.y >   HEIGHT:
        ship.y = 0

    fireball_star_collided = fireball.colliderect(star)

    if fireball_star_collided:
        score += 10
        place_fireball2()
    place_fireball()

    star_collected = ship.colliderect(star)

    if star_collected:
        score +=5
        place_star2()
    place_star()

    meteor_collided = ship.colliderect(meteor)

    if meteor_collided:
        score -=2
        place_meteor2()
    place_meteor()

    laser_collided = ship.colliderect(laser)

    if laser_collided:
        score -=1
        place_laser2()
    place_laser()
clock.schedule(time_up, 60.120)

pgzrun.go
