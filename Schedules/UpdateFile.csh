#!/bin/tcsh

set last_JD = "2458475.5"
while (-f auto-update-web)
    set sch_JD = `python FindMJD.py |awk '{print $1}'`
    set UnixT = `python FindMJD.py |awk '{print $2}'`
    if ($sch_JD != $last_JD) then
        echo Going to read from $sch_JD
        set FILE = "Schedules/Schedule_JD"$sch_JD".dat"
        cp $FILE /home/chitrang/Pulsar-Monitor-Web/chan_18c/static/Planned_Obs.csv
        echo  $FILE `date` >> /psr_scratch/cng/web-monitor/Schedules/log.log
        set last_JD = `echo $sch_JD`
        echo Going to sleep for a day at `date`
        sleep 20.9h
    endif
    echo "Last" $last_JD "CURRENT" $sch_JD at unix time $UnixT
    sleep 10
end
exit
