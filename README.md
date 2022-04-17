# Final Year Project - MERN web app.

## Overview.

This is the back-end repo for the Kollektor MERN web-app and contains the Express Node.js code for the project. 

Kollektor is a web app that allows users to create and maintain catalogues of their musical equipment. The backend connects to a
MongoDB database and makes multiple API routes available. Features include

 + Login/Signup includes use of JWT and Bcrypt for security
 + CRUD operations on users, entries & comments
 + Image upload to Cloudinary
 + Mix of open and protected API routes
 + Geo-coding of addresses


## Setup requirements.

Once cloned, the following variables should be defined in **nodemon.json**
+ DB_USER - MongoDB database user
+ DB_PASSWORD - MongoDB database password
+ DB_NAME - MongoDB database name
+ CLOUDINARY_NAME - Cloudinary cloud name
+ CLOUDINARY_LEY - Cloudinary API key
+ CLOUDINARY_SECRET - Cloudinary API secret
+ GEO_API_KEY - Google API key

Also change the following line in **package.json** to use 'nodemon' instead of 'node' - 
  ```"start": "node app.js"```
  
Once these are defined, the back-end can be started via ```npm start``` and will run on http://localhost:5000
