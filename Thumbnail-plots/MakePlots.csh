#!/bin/tcsh

set ImagePath = "/home/chitrang/Pulsar-Monitor-Web/chan_18c/static/Image/"
set SOFT = "/home/cng/softwares/pipeline-pdmp/"

while (-f auto-plots)
    foreach Beam (0 1 2 3 4 5 6 7 8 9)
        echo Beam now is $Beam

        #Find the latest fold mode file for a given beam
        set NFILE = `ls -lrt /psr_archive*/fold_mode/*beam_$Beam*.ar|awk '{if ($5 != 0) print $NF}'|wc -l`
        if ($NFILE >0) then
            set FILE = `ls -lrt /psr_archive*/fold_mode/*beam_$Beam*.ar|awk '{if ($5 != 0) print $NF}'|tail -n 1`
            set FILELAST = `cat LastPlot_$Beam.lis`
            if ($FILE != $FILELAST) then
                echo Beam $Beam got new file $FILE
                set BASE = `echo $FILE|awk -F'/' '{print $NF}'|awk -F'.ar' '{print $1}'`
                set NAME = `echo $BASE|awk -F'_' '{print $2}'`
                set LNAME = `cat LastPlot_$Beam.lis |awk -F'/' '{print $NF}'|awk -F'_' '{print $2}'`
                set MJD = `echo $BASE|awk -F'_' '{print $(NF-1)}'`
                echo $BASE $NAME $LNAME

                ln -s $FILE .
                paz -k killfile2 -S '0 0' -W '0 0' -e pazi $BASE.ar
                pam --setnchn 32 -m $BASE.pazi
                #Make Time scrunched files
                psrplot -jTpD -pfreq -DBeam$Beam\_fT.ps/cps $BASE.pazi
                convert -rotate 90 Beam$Beam\_fT.ps Beam$Beam\_fT.png
                mv Beam$Beam\_fT.png $ImagePath/thumb0$Beam-fT.png
                #Make Freq srunched files
                psrplot -jFpD -ptime -DBeam$Beam\_Ft.ps/cps $BASE.pazi
                convert -rotate 90 Beam$Beam\_Ft.ps Beam$Beam\_Ft.png
                mv Beam$Beam\_Ft.png $ImagePath/thumb0$Beam-Ft.png

                rm ./$BASE.ar $BASE.pazi
            endif
            echo $FILE>LastPlot_$Beam.lis
        endif
    end
    sleep 10
end

exit		
