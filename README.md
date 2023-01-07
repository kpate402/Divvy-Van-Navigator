Divvy-Van-Navigator

This is a group project made by the efforts of Me, Mike Gibson, and Paul Chirmal based on the design idea of Stuti Thapliyal,
Prithviraj Sengupta, and Ebrahim Broachwala. The idea of this project is to help the Divvy Bike Organization in optimizing the 
transport and pickup of Divvy vehicles between Divvy stations/docks done by Divvy Van Drivers. Divvy Bike is a bike share program 
in the city of Chicago where people can take a bike from a Divvy station and us it to travel faster in the city. The bike taken 
can be put in any other station in the city but this can lead to overflow or lack of bikes at specific stations. Divvy Van Drivers
are tasked to pick up bikes from stations with overflow and drop off bikes at places with a lack of bikes.

Divvy Van Navigator Prototype:  

Mike Gibson, Paul Chirmal, and I created a prototype of a webpage that could be used to help Divvy Van Driver's with there 
tranportation of bikes between stations. This is done by tackling the Travelling Knapsack problem while adding other helpful
features such as station information and bike database for all bikes and stations. The current prototype webpage is split into
a login screen, A Maps page, Next Page, and Bikes page.

Login Screen: 
This is the starting screen where Divvy Van Drivers put in the login information. Since the current version of the webpage
is a prototype, the login screen only works by typing a number between 1 - 5 into the input box and clicking submit. This 
will then open the Maps page from where other pages can also be accessed. 
<img width="1440" alt="image" src="https://user-images.githubusercontent.com/74434573/211171800-98bcf1c1-8147-4dc5-8e9d-5a27eca5884a.png">


Maps Page:
This page contains a map of all Divvy stations in the Chicago area. There are icons representing Divvy stations and 
a list of Divvy stations on the side of the map to find specific stations easily. Clicking on any of the station icons
or name of station in the list will cause a box containing relevant station informaiton to pop up. Information includes
the number of bikes, electric bikes, and scooters in said station. All this information is obtained by making API calls
to the Divvy bike organization and having that information stored in a database
<img width="1440" alt="image" src="https://user-images.githubusercontent.com/74434573/211171770-63169317-fc86-4bbc-b7dc-033ab2a42933.png">


Next Page: 
This page was meant as a means of navigating Divvy Van Drivers to their next location by using an algorithm to determine
the closest location most in need of bikes. For the prototype we were unable to finish the algorithm and for now the 
navigation set on this page leads to the closest Divvy station near the users location. It also determines how many of each
type of vehicle to leave or take
<img width="1440" alt="image" src="https://user-images.githubusercontent.com/74434573/211171742-70624ddf-7f3e-49e1-a891-7be6f9b85d65.png">


Bikes Page: 
This page was originally a page with the related bike information of bikes in the Divvy Van Driver's Van. Later, it was
decided that the Divvy Van Driver does not need all this information so it was changed to show the number of each kind
of vehicles in the Van. Currently, all related vehicles informations is obtained through API calls to the Divvy bike organization 
that information stored in a database which is used to figure out number of vehicles in the van based on type
<img width="1440" alt="image" src="https://user-images.githubusercontent.com/74434573/211171714-85b8ad20-4d5a-4cfa-9e91-30b6f17b6bc8.png">

