a=0
b=1
for count in range(0, 10000):
    print(a+b)
    save_a = a
    a = b
    b = save_a+b