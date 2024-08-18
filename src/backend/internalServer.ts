import { getCurrentIPAddresses } from './utils';
import { server } from './app';

export const startInternalServer = () => {
  const iPAddresses = getCurrentIPAddresses();
  const host = iPAddresses[0];

  try {
    server.listen(1511, () => {
      console.log(
        `*****internal server is up listening on http://${host}:1511/`,
      );
    });
  } catch (error) {
    console.log('Error: fail to start server ', error);
  }
};

export const closeInternalServer = () => {
  if (server) {
    server.close();

    console.log(`internal server is down...`);
  }
};
