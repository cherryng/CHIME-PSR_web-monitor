import datetime
import time
timenow = datetime.datetime.utcfromtimestamp(time.time())
yy = timenow.year
mm= timenow.month
if (mm == 1) or (mm == 2):
    mm = mm+12
    yy=yy-1
dd = timenow.day
A = int(yy/100.)
B = 2-A+int(A/4.)
C = int(365.25*yy)
D = int(30.6001*(mm+1))
sch_JD = B+C+D+dd+1720994.5

print sch_JD, time.time(), timenow, mm, dd, yy


