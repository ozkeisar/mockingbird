
<p align="center">
<img src="https://github.com/ozkeisar/mockingbird/assets/34401842/51320104-1f8d-4734-b964-661a8882c27e" width="200" align='center' >
<p>




# Mockingbird

Mockingbird is a robust tool for creating and managing mock environments, enhancing productivity, and streamlining integration. It integrates with Git for a simple and secure solution to develop and test APIs without additional servers.


<p align="center">
    <img src="https://github.com/ozkeisar/mockingbird/assets/34401842/5e3f1aa5-a730-444f-9715-9c82dfdc67d9" width="500"  >
<p>


## Features

- **Intuitive Interface**: Easy-to-use UI for project and server management.
- **Git Integration**: Works seamlessly with your Git setup.
- **Multiple Environments**: Manage various servers and mock environments.
- **Customizable Responses**: Define responses using functions, objects, or proxies.
- **Presets**: Create collections of routes with selected responses for efficient testing and debugging.


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

## Contributing

Contributions are welcome! Go to [issues](https://github.com/ozkeisar/mockingbird/issues) page for any suggestion issues or feature.



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

