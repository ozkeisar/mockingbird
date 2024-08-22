
<p align="center">
<img src="https://github.com/ozkeisar/mockingbird/assets/34401842/51320104-1f8d-4734-b964-661a8882c27e" width="200" align='center' >
<p>




# Mockingbird

Mockingbird is your go-to solution for efficiently creating and managing mock environments. It integrates effortlessly with Git, offering a secure and server-free method to develop and test APIs. With Mockingbird, you can quickly simulate various scenarios, significantly boosting your productivity and streamlining the integration process. It also supports mocking GraphQL APIs, multiple response options for each route, and the ability to create presets for easy scenario switching, making it an incredibly versatile tool for any development workflow. environments, enhancing productivity, and streamlining integration. It integrates with Git for a simple and secure solution to develop and test APIs without additional servers.


<p align="center">
    <img src="https://github.com/user-attachments/assets/73315dfb-051b-4304-a6bb-133a0c84b057" width="750"  >
<p>


## Features

- **Intuitive Interface**: Easy-to-use UI for project and server management.
- **Git Integration**: Works seamlessly with your Git setup.
- **Multiple Environments**: Manage various servers and mock environments.
- **Customizable Responses**: Define responses using functions, objects, or proxies.
- **Presets**: Create collections of routes with selected responses for efficient testing and debugging.
- **GraphQL support**: Define requests with graphQL schema support + record GraphQL requests. 


## Getting Started

### Download and Installation

1. Download the latest version from the [Releases](https://github.com/ozkeisar/mockingbird/releases) page.
2. Run the installer and follow the instructions.

### Initializing Your Project

1. **Launch Mockingbird**: Open the application.
2. **Start a New Project**: 
   - Clone an existing project from your Git service.
   - Create a new local project (you can connect it to Git later).
   - Open an existing project.

### Cloning a Project

1. Choose HTTPS or SSH cloning.
2. Enter the repository URL and provide a unique name.
3. Click `CLONE` to set up your project.

### Setting Up Your Server

1. **New Server**: Click `+ new server`, name it, and hit `SAVE`.
2. **New Parent**: Add a parent to hold routes, specify the path and filename.
3. **Add Route**: Define the HTTP method and path, then add the route.
4. **Add Response**: Choose between function, object, or proxy responses, set response details, and save.

### Running Your Server

- Start your server and get the server address.
- Change the `baseUrl` in your project to direct API calls to the Mockingbird server.
- Use the console to view requests handled by Mockingbird.

## Advanced Setup

### Configuring Your Mock Server

1. **Set Up Your Server**: 
   - Open server details.
   - Enter your real server's base URL in the Target URL field to let Mockingbird act as a proxy.

2. **Redirect Your Application**: 
   - Click `Start Server`.
   - Replace your live server URL with the Mockingbird server URL in your application code.

3. **Monitoring API Calls**: 
   - Use the Mockingbird console to view all API requests and how they are handled.

4. **Creating Local Routes**: 
   - Add Parent: Define the parent path.
   - Add Route: Add specific routes.
   - Add Response: Define responses for routes.

## Presets

Presets in Mockingbird are collections of routes with selected responses. Applying a preset updates the active responses on all routes in the preset to their specified responses. This feature is particularly useful for:

- **QA Automation and Manual QA**: Quickly switch between different test scenarios.
- **Developers**: Debug specific scenarios efficiently without manually changing each route.

To create a preset:
1. Define a collection of routes.
2. Select the desired responses for each route.
3. Save the preset.

To apply a preset:
1. Select the desired preset from the list.
2. Apply the preset to update all active responses.

## creating Docker image

Docker folder contains scripts to run the project as a standalone server.

`npm run build:backend` to build teh JS files required for the standalone server.

Then use `docker build . -t {username}/mockingbird:{version}` to create the image.

## Licensing

Mockingbird is dual-licensed under the GNU Affero General Public License v3.0 (AGPLv3) for open-source use and a commercial license for proprietary use. For more details, see [LICENSE](./LICENSE) and [COMMERCIAL_LICENSE](./COMMERCIAL_LICENSE).

## Contributing

We welcome contributions to Mockingbird! Please read and agree to our Contributor License Agreement (CLA) before contributing. For more details, see [CONTRIBUTING](./CONTRIBUTING.md).

---

For more details, visit the following articles:
- [Mockingbird: New tool for your mock environments](https://dev.to/ozkeisar/mockingbird-new-tool-for-your-mock-environments-49j)
- [Setting Up Your Mock Server with Mockingbird](https://dev.to/ozkeisar/setting-up-your-mock-server-with-mockingbird-1b72)




## Troubleshooting
### Error - Developer Cannot be Verified (Mac Users)

 -  **Open terminal and Run Command:**
   
        `xattr -c /Applications/Mockingbird.app` 
        
 -  **Verify Mockingbird:**
    
    -   Once the command has been executed successfully, try running Mockingbird again.

For support or inquiries, contact us at ozkeisar@gmail.com

Spread your wings with Mockingbird! 🚀

