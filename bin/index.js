#! /usr/bin/env node
import { cancel, intro, isCancel, outro, spinner, text, log } from '@clack/prompts';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

const repoUrl = 'https://github.com/realdealneill/rdn-convex-auth.git';

async function runCommand(command, args, directory) {
    try {
        const { stdout } = await execa(command, args, { cwd: directory });
        log.info(`Command output:\n${stdout}`);
        return stdout;
    } catch (error) {
        log.error(`Error executing command: ${command} ${args.join(' ')}`);
        log.error(`Error message: ${error.message}`);
        if (error.stdout) log.error(`Command output:\n${error.stdout}`);
        if (error.stderr) log.error(`Command error output:\n${error.stderr}`);
        throw error;
    }
}

async function runInteractiveCommand(command, args, directory) {
    try {
        await execa(command, args, {
            cwd: directory,
            stdio: 'inherit'
        });
    } catch (error) {
        log.error(`Error executing interactive command: ${command} ${args.join(' ')}`);
        log.error(`Error message: ${error.message}`);
        throw error;
    }
}

async function runNpxCommand(args, directory, interactive = false) {
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    if (interactive) {
        return runInteractiveCommand(npxCommand, args, directory);
    } else {
        return runCommand(npxCommand, args, directory);
    }
}

async function main() {
    intro(`create-convex-auth-app`);

    const projectName = await text({
        message: 'Project Name?',
        placeholder: 'convex-auth-app',
        validate(value) {
            if (value.length === 0) return `Name is required!`;
        },
    });

    if (isCancel(projectName)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const projectPath = path.join(process.cwd(), projectName);
    const s = spinner();

    try {
        // Step 1: Clone the repo
        s.start('Cloning repository');
        await runCommand('git', ['clone', repoUrl, projectName], process.cwd());
        s.stop('Repository cloned successfully');

        // Step 2: Replace "name" in package.json
        s.start('Updating package.json');
        const packageJsonPath = path.join(projectPath, 'package.json');
        let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.name = projectName;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        s.stop('package.json updated');

        // Step 3: Run npm install
        s.start('Installing dependencies');
        await runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], projectPath);
        s.stop('Dependencies installed');

        // Step 4: Run npx convex dev
        log.info('Initializing Convex (this will be interactive)');
        await runNpxCommand(['convex', 'dev', '--once'], projectPath, true);
        log.success('Convex initialized');

        // Step 5: Run npx @convex-dev/auth
        log.info('Setting up Convex auth (this will be interactive)');
        await runNpxCommand(['@convex-dev/auth'], projectPath, true);
        log.success('Convex auth setup complete');

        // Step 6: Print GitHub OAuth app instructions
        log.info('\nPlease go to github.com user settings > developer settings > oauth apps to add a new oauth app.');

        // Step 7: Retrieve CONVEX_DEPLOYMENT and print callback URL
        s.start('Retrieving Convex deployment information');
        const envContent = fs.readFileSync(path.join(projectPath, '.env.local'), 'utf8');
        const convexDeploymentFull = envContent.match(/CONVEX_DEPLOYMENT="?(.+?)"?$/m)[1].replace(/^dev:/, '');
        const convexDeployment = convexDeploymentFull.split(' ')[0]; // Take only the part before the first space
        s.stop('Deployment information retrieved');

        log.info(`\nUse this callback URL for your GitHub OAuth app:`);
        log.info(`https://${convexDeployment}.convex.site/api/auth/callback/github`);

        // Step 8: Prompt for GitHub client ID and secret
        const githubClientId = await text({
            message: 'Enter your GitHub Client ID:',
            validate(value) {
                if (value.length === 0) return `GitHub Client ID is required!`;
            },
        });

        if (isCancel(githubClientId)) {
            cancel('Operation cancelled.');
            process.exit(0);
        }

        const githubClientSecret = await text({
            message: 'Enter your GitHub Client Secret:',
            validate(value) {
                if (value.length === 0) return `GitHub Client Secret is required!`;
            },
        });

        if (isCancel(githubClientSecret)) {
            cancel('Operation cancelled.');
            process.exit(0);
        }

        // Steps 9-10: Set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET
        s.start('Setting GitHub Client ID and Secret');
        await runNpxCommand(['convex', 'env', 'set', 'AUTH_GITHUB_ID', githubClientId], projectPath, true);
        await runNpxCommand(['convex', 'env', 'set', 'AUTH_GITHUB_SECRET', githubClientSecret], projectPath, true);
        s.stop('GitHub Client ID and Secret set');

        outro(`You're all set!`);
    } catch (error) {
        s.stop('An error occurred');
        log.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

main().catch(console.error);