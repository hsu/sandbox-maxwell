# Write your code here :-)

from turtle import *
speed(0)
color('red', 'blue')
begin_fill()
forward(-400)
while True:
    forward(400)
    left(179)
    print(pos())
    if pos()[0] < -199 and abs(pos()[1]) < 1:
        break
end_fill()
done()

#print(1+2+3+4+5+6+7+8+9+10)
