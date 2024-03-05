
from turtle import *
speed(0)
penup()
backward(400)
pendown()

start = pos()


color('red', 'yellow')
begin_fill()
while True:
    forward(800)
    left(170)

    if pos() == start:
        break
end_fill()
done()
