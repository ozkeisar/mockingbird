
<p align="center">
<img src="https://github.com/ozkeisar/mockingbird/assets/34401842/51320104-1f8d-4734-b964-661a8882c27e" width="200" align='center' >
<p>




# Mockingbird

Mockingbird is a tool designed to help software developers test their apps without needing the real server or backend ready. Imagine you’re building a new app, but the part of the system that handles data isn’t finished yet. Instead of waiting around, you can use Mockingbird to create a pretend version of that system. This allows you to keep working and testing your app as if everything is already set up, saving time and frustration. 


<p align="center">
    <img src="https://github.com/user-attachments/assets/73315dfb-051b-4304-a6bb-133a0c84b057" width="750"  >
<p>


## Main Features

1. **Multiple Responses for Each Route**: 
   - Create different responses for the same API route, allowing you to simulate various scenarios like successful requests or errors. This helps you test how your app handles different situations.

2. **Presets**: 
   - Easily switch between different sets of responses with just one click. This feature allows you to test how your app behaves in various scenarios without manually changing the responses each time.

3. **Git Integration**: 
   - All mock data is stored in a Git repository, providing version control and security without the need for additional servers. You can track changes over time and collaborate more effectively.

4. **Proxy Functionality**: 
   - Mockingbird can listen to actual API requests and responses, helping you quickly create mocks based on real API calls. This saves time by automating part of the setup process.

5. **API Call Monitoring**: 
   - Monitor all incoming API calls to see exactly what requests are being made by your app and how they’re handled by Mockingbird.

6. **GraphQL Support**: 
   - Full support for creating and managing GraphQL mocks, making it easy to work with GraphQL APIs during development.

7. **Multiple Projects and Servers**: 
   - Manage different projects and servers within Mockingbird, making it a versatile tool for teams working on multiple applications.

8. **Built-in API for Testing**: 
   - Includes a built-in API that allows you to control Mockingbird during automated tests, helping you seamlessly integrate it into your testing workflow.

9. **Docker image**: mockingbird have a docker image that let's you set it up as part of your ci/cd, make it suitable for your e2e testing. 

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

Then use `docker build . -t {username}/mockingbird` to create the image.

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

