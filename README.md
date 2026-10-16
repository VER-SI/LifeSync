Full-Stack Mobile App (Assignment 3)

In assignment 3 I have use Firebase.There is a lot of changes I made in this assignment for one the file are now more organize compare the one i submitte before and in the Home.tsx there is now a <Drawer> instead of a bureger menu icon that redirect the user to the Menu.tsx  thus there are more file such as insight,profile etc.

LogInDetails   :It will have firebase authentication for now using email and password and the user can log in as anonymous(guest).
SignUpDetails  :The newly created account will be save to the firebase using email and password.
Home.tsx       :It can now create,delete or change an event
Settings       :This will alow the user to change any prefrences they want to the app and will save the prferences to the firebase(Darkmode,notification).
Backend        :and as mention before the backend will be Firebase(authentication and Firestore Database).


Data Model

events Collection
Stores user tasks.Here is an example 

"title": "Meeting with Ani",
"subtitle": "Guest 11 mon",
"date": "2025-08-11",
"time": "12:42 AM",
"color": "#66D2B1",
"userId": "tIOLkCwnaofJpwLWvTVEWKpElyB2"



Preference Collection 
Store user preferences(Darkmode,notification) here is an example

"theme": "light",
"notificationsEnabled": true


Additional info/Issue
There will be some of the screen are wrote as incomplete.For some reason when starting the project if the user is trying to go to the Home.tsx after filing in the necessary credential it will not redirect te user to the Home.tsx,it first need to open every file inside the folder (tabs),if that does not work it need to click save on every filr in the (tabs) folder without changing anything or sometime just save every file in the lifesync and randomly it work.This causes a lot of issue when i try finishing the assignment as it keep redirect me to the not-found.tsx implying that the home.tsx does not exist.
