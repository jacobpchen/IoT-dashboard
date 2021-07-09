This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Page Overview. 
**/dashboard**
Displays information of a single carport received for user. 
Selected carport from CarPort Page is transferred and loaded otherwise the first loaded carPort is displayed.

**/carPorts** 
Displays overview information regarding carPorts and allows for navigation to dashboard with a carport selected

**/CarPortAssignment**
Displays list of all car ports and allows for administrator users to add and remove user access to specific carports

**/overview**
Displayed as Admin Overview on left navigation. Verifies user is Admin and if so displays data of each CarPort in the system and the total of all. Users are redirected away if they do not hold the neccesary priviledges

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`

Uploads the frontend static files to AWS S3 and deploys it to Cloudfront by invalidating caches.


### Color Scheme
The color variables used in both css and js are contained in `src/scss/_variables.scss`.

* `$background-color`: Defines the background color of nav bars and their items
* `$text-color`: Defines the text color for items affected by background-color
* `$highlight-color`: Color of hovered / selected nav items, border color for inverter graph
* `$highlight-color-light`: Color of inverter graph body
* `$highlight-color-2`: Color of second smart citizen graph
* `$highlight-color-2-light`: Currently unused
* `$highlight-color-3`: Border color for second inverter graph
* `$highlight-color-3-light`: Body color for second inverter graph
* `$highlight-color-4`: Color of first smart citizen graph
* `$total-graph-color`: Border color for total graph
* `$total-graph-color-light`: Body color for total graph