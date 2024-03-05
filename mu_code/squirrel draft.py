
# Write your code here :-)
from random import randint
from random import uniform
import pgzrun
import pygame
import time

game_over = False
WIDTH = 900
HEIGHT = 700
squirrel_x = WIDTH/2
squirrel_y = HEIGHT/2
squirrel_size = 25
squirrel = Actor("/users/pgyhuang/downloads/images/squirrel green.png")
squirrel_img = pygame.transform.scale(squirrel._surf,(squirrel_size,squirrel_size))
squirrel._surf = squirrel_img

num_squirrels = 7
bad_squirrels = [None]*num_squirrels
bad_poses = [None]*num_squirrels
count = 30
bad_dposes = [(0,0)]*num_squirrels
bad_squirrels_sizes = [0]*num_squirrels

# initialize all bad squirrels
for i in range(0, num_squirrels):
    bad_squirrel = Actor("/users/pgyhuang/downloads/images/bad squirrel green.png")
    rand_size = randint(10,100)
    bad_squirrels_sizes[i]=rand_size
    tmp1 = pygame.transform.scale(bad_squirrel._surf,(rand_size, rand_size))
    bad_squirrel._surf = tmp1
    bad_squirrels[i] = bad_squirrel
    bad_pos = (randint(0, WIDTH/4), randint(0, HEIGHT/4))
    bad_poses[i] = bad_pos

def draw():
    screen.clear()
    screen.fill("green")
    #screen.blit("/users/pgyhuang/downloads/images/squirrel.png",(WIDTH/3, HEIGHT/3))
    squirrel.pos = (squirrel_x, squirrel_y)
    squirrel.draw()
    for i in range(0, num_squirrels):
        bad_squirrels[i].pos = (bad_poses[i])
        bad_squirrels[i].draw()



def update():
    global squirrel_x
    global squirrel_y
    global bad_poses
    global count, bad_dposes
    global squirrel_size
    global bad_squirrels_sizes
    global game_over



    if game_over:
        screen.draw.text("game over", color="white", topleft=(WIDTH/2, HEIGHT/2), fontsize = 100)
        print("game over")
        time.sleep(1)
        return




    if keyboard.left:
        squirrel_x = squirrel_x - 5
        squirrel._surf = pygame.transform.flip(squirrel_img, 1, 0)
    elif keyboard.right:
        squirrel_x = squirrel_x  + 5
        squirrel._surf = squirrel_img
    elif keyboard.up:
        squirrel_y = squirrel_y  - 5
    elif keyboard.down:
        squirrel_y = squirrel_y  + 5

    if squirrel_x < 0:
        squirrel_x = WIDTH
    elif squirrel_x >   WIDTH:
        squirrel_x = 0

    if squirrel_y < 0:
        squirrel_y = HEIGHT
    elif squirrel_y >   HEIGHT:
        squirrel_y = 0

    count = count + 1
    for i in range(0, num_squirrels):
        (x, y) = bad_poses[i]
        (dx, dy) = bad_dposes[i]

        if count > 30:
            dx = uniform(-5.0, 5.0)
            dy = uniform(-5.0, 5.0)
            bad_dposes[i] = (dx, dy)
        x = x + dx
        y = y + dy
        if x < 0:
            x = WIDTH
        elif x >   WIDTH:
            x = 0

        if y < 0:
            y = HEIGHT
        elif y >   HEIGHT:
            y = 0
        bad_poses[i] = (x, y)
    if count > 30:
        count = 0

    # detect squirrel collision
    for i in range (0, num_squirrels):


        squirrel_collided = bad_squirrels[i].colliderect(squirrel)

        if squirrel_collided:
            if bad_squirrels_sizes[i] < squirrel_size:
                # bad squirrel is smaller
                squirrel_size = squirrel_size + bad_squirrels_sizes[i]
                squirrel._surf = pygame.transform.scale(squirrel_img,(squirrel_size,squirrel_size))
                rand_size = randint(10,100)
                bad_squirrels_sizes[i]=rand_size
                bad_pos = (randint(0, WIDTH), randint(0, HEIGHT))
                bad_poses[i] = bad_pos
            elif bad_squirrels_sizes[i] > squirrel_size:
                # bad squirrel is bigger
                game_over = True







pgzrun.go()
