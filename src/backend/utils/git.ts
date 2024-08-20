import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { getProjectPath } from './files';

export const isGitInstalled = async () => {
  try {
    // Attempt to execute a Git command
    await simpleGit().listRemote(['--get-url']);
    // If the command executed successfully, Git is installed
    return true;
  } catch (error) {
    // If an error occurs, Git is not installed or not properly configured
    return false;
  }
};

export async function checkGitConnection(projectName: string) {
  const currentRepoFolderPath = await getProjectPath(projectName);

  const git = simpleGit(currentRepoFolderPath);

  try {
    await git.listRemote(['--get-url']);
    console.log('Connection to Git server established.');
    return true;
  } catch (error) {
    console.error('Error connecting to Git server:', error);
    return false;
  }
}

export const checkIsGitInit = async (projectName: string) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);

    // Specify the path to the folder
    const git = simpleGit(currentRepoFolderPath);

    // Check if the folder is a Git repository
    const isRepo = await git.checkIsRepo();

    return isRepo;
  } catch (error) {
    console.log('======checkIsGitInit error', error);

    // If an error occurs, the folder is not a Git repository or Git is not properly configured
    return false;
  }
};

export const isCurrentBranchWithoutRemote = async (projectName: string) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);
    const git = simpleGit(currentRepoFolderPath);

    // Get the name of the current branch
    const branchSummary = await git.branch();
    const currentBranch = branchSummary.current;

    // Get the remote for the current branch
    const remote = await git.raw(['config', `branch.${currentBranch}.remote`]);

    // If there is no remote configured for the current branch, return true
    return !remote.trim();
  } catch (error) {
    console.error('Error checking if current branch has no remote:', error);
    throw error;
  }
};

export const hasUncommittedChanges = async (projectName: string) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);

    // Specify the path to your Git repository
    const git = simpleGit(currentRepoFolderPath);

    // Check for uncommitted changes
    const diffSummary = await git.diff();

    // If there are uncommitted changes, diffSummary will not be empty
    const uncommittedChanges = diffSummary !== '';

    return (
      uncommittedChanges || (await isCurrentBranchWithoutRemote(projectName))
    );
  } catch (error) {
    return false;
  }
};

function formatBranchName(name: string) {
  // Replace spaces with dashes
  let formattedName = name.trim().replace(/\s+/g, '-');

  // Remove special characters
  // eslint-disable-next-line no-useless-escape
  formattedName = formattedName.replace(/[^\w\-]+/g, '');

  // Convert to lowercase
  formattedName = formattedName.toLowerCase();

  // Trim any leading or trailing dashes
  formattedName = formattedName.replace(/^-+|-+$/g, '');

  // Check if the branch name starts with a digit
  // If so, prefix it with "branch-" to make it valid
  if (/^\d/.test(formattedName)) {
    formattedName = `branch-${formattedName}`;
  }

  // Check if the branch name is empty
  // If so, provide a default name
  if (formattedName === '') {
    formattedName = 'default-branch-name';
  }

  return formattedName;
}

export const checkoutToBranch = async (
  projectName: string,
  branchName: string,
  createIfNotExist = false,
) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);

    const git = simpleGit(currentRepoFolderPath);
    if (createIfNotExist) {
      await git.checkoutLocalBranch(formatBranchName(branchName));
    } else {
      await git.checkout(branchName, ['--force']);
    }
  } catch (error) {
    console.error(`Error checking out to branch '${branchName}':`, error);
    throw error;
  }
};

export const getCurrentBranch = async (projectName: string) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);

    const options: Partial<SimpleGitOptions> = {
      baseDir: currentRepoFolderPath,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };

    // when setting all options in a single object
    const git: SimpleGit = simpleGit(options);

    // Get the current branch
    const branchSummary = await git.branch();

    return branchSummary.current;
  } catch (error) {
    return null;
  }
};

export const getBranches = async (projectName: string, withFetch = false) => {
  try {
    const haveConnection = await checkGitConnection(projectName);
    if (!haveConnection) {
      return [];
    }

    const currentRepoFolderPath = await getProjectPath(projectName);

    const options: Partial<SimpleGitOptions> = {
      baseDir: currentRepoFolderPath,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };

    // when setting all options in a single object
    const git: SimpleGit = simpleGit(options);

    if (withFetch) {
      await git.fetch(['--all']);
    }

    // Get the current branch
    const branchSummary = await git.branch();

    // Extract the current branch
    const branches = Object.keys(branchSummary.branches);

    return branches;
  } catch (error) {
    return [];
  }
};

export const commitAndPushChanges = async (
  projectName: string,
  commitMessage: string,
) => {
  // Specify the path to your Git repository
  const currentRepoFolderPath = await getProjectPath(projectName);
  const git = simpleGit(currentRepoFolderPath);

  // Set push.default to current
  await git.addConfig('push.default', 'current');

  // Add changes
  await git.add('.');

  // Commit changes
  await git.commit(commitMessage);

  // Push changes to the current branch
  await git.push(['--force']);
};

export const getRemoteRepositoryUrl = async (projectName: string) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);
    const git = simpleGit(currentRepoFolderPath);

    // Get the URL of the remote repository named 'origin'
    const remoteUrl = await git.remote(['get-url', 'origin']);

    return remoteUrl?.trim();
  } catch (error) {
    console.error('Error getting remote repository URL:', error);
    throw error;
  }
};

export const pushChanges = async (projectName: string) => {
  try {
    const currentRepoFolderPath = await getProjectPath(projectName);
    const git = simpleGit(currentRepoFolderPath);

    // Add changes
    await git.add('.');

    // Commit changes
    await git.commit('commit changes');

    const pushToRemote = await isCurrentBranchWithoutRemote(projectName);

    const currentBranch = await getCurrentBranch(projectName);
    // Add changes if requested
    if (pushToRemote && currentBranch) {
      await git.push(['origin', currentBranch]);
    } else {
      await git.push(['-f']);
    }
  } catch (error) {
    console.error('Error pushing changes:', error);
    throw error;
  }
};

export const connectFolderToGit = async (
  projectName: string,
  remoteUrl: string,
): Promise<void> => {
  const currentRepoFolderPath = await getProjectPath(projectName);
  const git = simpleGit(currentRepoFolderPath);

  try {
    // Initialize Git repository if not already initialized
    await git.init();

    // Add files
    await git.add('.');

    // Commit changes
    await git.commit('Initial commit');

    // Set remote repository
    await git.addRemote('origin', remoteUrl);

    // Push changes to remote
    await git.push('origin', 'master');

    console.log(
      'Folder connected to Git repository and changes pushed successfully.',
    );
  } catch (error) {
    console.error('An error occurred:', error);
  }
};
