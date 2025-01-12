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
   Create different responses for the same API route, allowing you to simulate various scenarios like successful requests or errors. This helps you test how your app handles different situations.

2. **Presets**:
   Easily switch between different sets of responses with just one click. This feature allows you to test how your app behaves in various scenarios without manually changing the responses each time.

3. **Git Integration**:
   All mock data is stored in a Git repository, providing version control and security without the need for additional servers. You can track changes over time and collaborate more effectively.

4. **Proxy Functionality**:
   Mockingbird can listen to actual API requests and responses, helping you quickly create mocks based on real API calls. This saves time by automating part of the setup process.

5. **API Call Monitoring**:
   Monitor all incoming API calls to see exactly what requests are being made by your app and how they’re handled by Mockingbird.

6. **GraphQL Support**:
   Full support for creating and managing GraphQL mocks, making it easy to work with GraphQL APIs during development.

7. **Multiple Projects and Servers**:
   Manage different projects and servers within Mockingbird, making it a versatile tool for teams working on multiple applications.

8. **Built-in API for Testing**:
   Includes a built-in API that allows you to control Mockingbird during automated tests, helping you seamlessly integrate it into your testing workflow.

9. **Docker image**: mockingbird have a docker image that let's you set it up as part of your ci/cd, make it suitable for your e2e testing.

## Mockingbird videos

<p align="left">
   <a href="https://youtu.be/PbwtlnNdHkQ?si=kVpj0nVWSBlk9eKg" target="_blank">
      <img src="https://github.com/user-attachments/assets/e7ebb1c3-85a5-4ca7-8947-6115df4d0efe" width="200" align='left' >
   How to set up mock server - Getting Started with Mockingbird
   </a>
   <br/>
</p>
<br/>
<br/>
<br/>
<br/>

<p align="left">
   <a href="https://youtu.be/wwYqo3e1ef8" target="_blank">
      <img src="https://github.com/user-attachments/assets/ec999dbc-2715-428d-9de6-ff34a4de5610" width="200" align='left' >
   Git + Mockingbird Tutorial: Simplify Mock API Management and Collaboration
   </a>
   <br/>
</p>
<br/>
<br/>
<br/>

## Mockingbird Guides

1. [Mockingbird: New Tool for Your Mock Environments](https://dev.to/ozkeisar/mockingbird-new-tool-for-your-mock-environments-49j)
2. [Setting Up Your Mock Server with Mockingbird](https://dev.to/ozkeisar/setting-up-your-mock-server-with-mockingbird-1b72)
3. [Mockingbird Presets: Optimizing API Development Workflows](https://dev.to/ozkeisar/optimizing-api-development-workflows-with-mockingbird-presets-17hc)
4. [Creating and Managing Multiple Projects and Servers with Mockingbird](https://dev.to/ozkeisar/creating-and-managing-multiple-projects-and-servers-with-mockingbird-a7b)
5. [I built a new way of mocking GraphQL server](https://dev.to/ozkeisar/i-built-a-new-way-of-mocking-graphql-server-i94)
6. [Dockerize Your Mockingbird Setup: A Quickstart Guide](https://dev.to/ozkeisar/how-to-use-the-mockingbird-docker-image-29mf)

## Licensing

Mockingbird is dual-licensed under the GNU Affero General Public License v3.0 (AGPLv3) for open-source use and a commercial license for proprietary use. For more details, see [LICENSE](./LICENSE) and [COMMERCIAL_LICENSE](./COMMERCIAL_LICENSE).

## Contributing

We welcome contributions to Mockingbird! Please read and agree to our Contributor License Agreement (CLA) before contributing. For more details, see [CONTRIBUTING](./CONTRIBUTING.md).

### creating Docker image

Docker folder contains scripts to run the project as a standalone server.

`npm run build:backend` to build teh JS files required for the standalone server.

Then use `docker build . -t {username}/mockingbird:{version}` to create the image.

      `docker buildx build \
      --platform linux/amd64,linux/arm64 \
      -t {username}/mockingbird:{version} \
      --push .`

## Troubleshooting

### Error - Developer Cannot be Verified (Mac Users)

- **Open terminal and Run Command:**

      `xattr -c /Applications/Mockingbird.app`

- **Verify Mockingbird:**

  - Once the command has been executed successfully, try running Mockingbird again.

For support or inquiries, contact us at ozkeisar@gmail.com

Spread your wings with Mockingbird! 🚀
