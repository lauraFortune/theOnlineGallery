# The Online Gallery 
[theonlinegallery.herokuapp.com](https://theonlinegallery.herokuapp.com/)<br><br>

Full CRUD Rich Internet Web application - designed to manage the inventory, clients and online presence for a small Art Gallery.
<br><br>
#### UX/UI
JQuery ‘hover’, ‘fade’, ‘animate’ and ‘scroll’ are used extensively throughout the site to enhance the user experience.  The navigation menu consists of a narrow sidebar which is always visible, displaying some quick click links to the user. Further links are revealed when appropriate through a slide-out nav bar, so as not to overwhelm the user. 

#### Data Structures
The Online Gallery consists of three main data structures - ‘Artists’, ‘Artworks’ and ‘Profiles’. JSON files were used to store the main data structures, while MySQL was used for authentication of the User model(‘Profiles’). ‘GearHost’ was used to host the MySQL database.



## Built With

#### Server Side:
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [EJS](https://ejs.co)
- [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [MySQL](https://www.mysql.com/)
- [GearHost](https://www.gearhost.com/)

#### Modules/Middleware:
- [Passport.js](http://www.passportjs.org/), &nbsp;[Bcrypt.js](https://www.npmjs.com/package/bcryptjs)

#### Languages:
- [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript),  &nbsp; [jQuery](https://jquery.com), &nbsp; [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), &nbsp; [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)


## Screenshots 

- Landing Page
![landingScreen](https://user-images.githubusercontent.com/48602973/77258576-52897380-6c73-11ea-9fa8-8f1dcff384ef.png)


- Nav Menu
![navigationMenu](https://user-images.githubusercontent.com/48602973/77258882-78177c80-6c75-11ea-8c96-d11c4877b14b.png)

- Browse Member Profiles
![browseMembers](https://user-images.githubusercontent.com/48602973/77259215-e8bf9880-6c77-11ea-8c79-74e4568b00ec.png)

- Admin Privelages
![admin](https://user-images.githubusercontent.com/48602973/77259230-0a208480-6c78-11ea-9a35-6687726f78b0.png)

-Browse and Edit Artists
![artistAdmin](https://user-images.githubusercontent.com/48602973/77259239-160c4680-6c78-11ea-8eb7-8f5b3457dded.png)

-Full Crud
![addArtists](https://user-images.githubusercontent.com/48602973/77259419-38529400-6c79-11ea-8b94-cb735c8c64d6.png)

-Browse and Edit Artwork
![adminGallery](https://user-images.githubusercontent.com/48602973/77259250-2d4b3400-6c78-11ea-93d9-7a0226a0c96b.png)

-Gallery
![gallery](https://user-images.githubusercontent.com/48602973/77259245-21f80880-6c78-11ea-98c6-396ba5ace34b.png)

## Setting Up

### NodeJs
1. Download and install NodeJs - https://nodejs.org/en/

### GearHost

You don't have a GearHost account....
   1. Navigate to GearHost and sign up for a free account - https://www.gearhost.com/
   2. Select 'Add CloudSite' and choose 'Create Cloudsite' (choose the free option)

You have a GearHost Account...
      
   1. Create a database
      - Select 'Databases' and choose 'Create Database'
      - Choose the MySQL free option and select 'Create Empty Database. You will be prompted to enter a Database Name (name of your choice)
      
   2. Database credentials will be needed when creating your .env file before running the application. Click on the new database that you have created and copy and save the           following details:
      - Database Name
      - Database server address
      - Username
      - Password
  
   
## Running the application in your local environment

1. Clone project 

   ```bash
   git clone https://github.com/lauraFortune/theOnlineGallery.git
   ```
2. Create a new file inside the root directory and name it '.env'. Populate your '.env' file based on the provided '.env.example' file inside 'theOnlineGallery' folder.<br>
   Example '.env' file:

   ```bash
   PORT = 3000
   HOST = den1.mysql9.gear.host
   USER = myNewDatabase
   DB_PASSWORD =  Yh~qTS9mR~d_
   DB = myNewDatabase
   ```

3. Create a Users table for authentication.
   - Open app.js file 
   - Navigate to heading - 'DATABASE SETUP -SQL  QUERIES' 
   - Uncomment  '/createusers' request
   -  Run app

   ```bash
   node app.js
   ```
   -  Navigate to http://localhost:3000/createusers to create your users table
   - Recomment '/createusers' request
   
4. Create system Admin for authorisation and application privelages:
   - Open app.js file 
   - Navigate to heading - 'DATABASE SETUP -SQL  QUERIES' 
   - Uncomment  '/makeAdmin' request
   -  Update the following line with the username of the user you wish to make an Admin:
      ```bash
      let sql = "UPDATE users SET admin = true WHERE username = '<admins username here>'"; 
      ```
   -  Run app
      ```bash
      node app.js
      ```
   -  Navigate to http://localhost:3000/makeAdmin to update the User table
   - Recomment '/makeAdmin' request
   
3. Run app

   ```bash
   node app.js
   ```
   
4. Open http://localhost:3000 to view the application in your browser.<br>

## Acknowledgments
- Tomomi Imura - [Custom form validation](https://girliemac.com/blog/2012/11/21/html5-form-validation/)
