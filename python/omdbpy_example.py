#!/usr/bin/env python3

# Import the imdb package.
import omdb
import pandas as pd
from omdb import Client
from pandas import ExcelWriter
from pandas import ExcelFile
import time

df = pd.read_excel('Dirs_and_Actors.xlsx')
print(df.columns)

omdb.set_default('apikey', 'f1110dd6')

count = 800
while count < 1000:
    result = omdb.get(title=df.filmName[count], tomatoes=True)
    print(df.filmName[count])
    #print(result.items())

    for name, value in result.items():
        if name == 'director':
            df['Director'][count] = value
        if name == 'actors':
            df['Lead Actor'][count] = value.split(",")[0]
    count = count + 1
    time.sleep(1)


writer = ExcelWriter('Dirs_and_Actors.xlsx')
df.to_excel(writer,'Sheet1',index=False)
writer.save()
