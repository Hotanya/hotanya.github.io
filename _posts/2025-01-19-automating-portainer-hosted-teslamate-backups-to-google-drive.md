---
title: Automating Portainer Hosted Teslamate Backups to Google Drive
date: '2025-01-19 16:16:00 +1200'
categories:
  - blog
tags:
  - tech
  - automation
---

[Teslamate](https://github.com/teslamate-org/teslamate) is a self-hosted data logger and visualization tool for Tesla vehicles. It provides detailed insights into driving patterns, charging history, and other vital statistics. However, ensuring that your Teslamate data is securely backed up is essential. This guide will walk you through automating the backup of Teslamate to Google Drive using `rclone` and a simple shell script.

A big thanks to pvo_dave and [TeslaEV](https://www.teslaev.co.uk/) UK for their comprehensive blog post, which this largely follows. See their blog post [here](https://www.teslaev.co.uk/how-to-perform-an-automatic-teslamate-backup-to-google-drive/) 

This post will be slightly modified for users who are using Portainer to run the Teslamate Docker container.  

## Step 1: Obtain a Google Client ID and Secret
Firstly, we will need to ensure that our Google account is setup to handle this automated backup process. 

1. Log in to the [Google Cloud Platform Console](https://console.developers.google.com/) with your Google account.
2. Create a new project or select an existing one.
3. Enable the Google Drive API:
    - Click **ENABLE APIS AND SERVICES** and search for "Drive".
    - Enable the **Google Drive API**.
4. Set up credentials:

        - Go to **Credentials** in the left-hand menu.
            - Click **Create Credentials** and select **OAuth Client ID**.
            - Configure the consent screen:
                - Set the **User Type** to **External**.
                    - Provide an **Application Name** (e.g., "Teslamate Backup") and your email addresses.
                    - Save and continue through the remaining screens.
                - Create an OAuth Client ID:
                - Select **Desktop App** (or **Other** if using Google Workspace).
                - Publish the app by navigating to the **OAuth Consent Screen** and clicking **Publish App**.
        5. Save your Client ID and Secret for the next steps.
    
## Step 2: Install and Configure `rclone`

1. SSH into your server where Teslamate is running.
2. Switch to the root user:
    ```
    sudo su
    ```
3. Install `rclone`:
    ```
    curl https://rclone.org/install.sh | sudo bash
    ```
4. Configure `rclone`:
    ```
    rclone config
    ```
    - Create a new remote: `n`
    - Name it (e.g., `gdrive`): `gdrive`        
    - Choose Google Drive as the storage type: `17`        
    - Enter your Client ID and Secret.        
    - Skip advanced configuration (`n`).        
    - Copy the link to a browser to create a token, then approve in the Google authentication screen (click Advanced, then click Go to TeslaMate (or whatever you called the service)) then click Allow on the popup, then Allow again for the Confirm your choices screen.        
    - Paste the verification code back into your terminal.        
    - Skip Team Drive configuration (`n`).       
    - Now run: `export RCLONE_DRIVE="gdrive"` 
5. Verify the setup:
    
    ```
    rclone listremotes
    ```
    
    Ensure `gdrive` appears in the list of remotes. If it doesn't show you’ll need to start the rclone config process again as something has gone wrong.   
6. Choose a local folder to copy the backups to. You can use whatever location or path you want:

    ```
    export RCLONE_PATH="/home/USER/Teslamate"
    ```

7. Create a directory in Google Drive for backups and a local path:
    ```
    rclone mkdir gdrive:Teslamate
    ```
8. Verify that the folder has been created:
    ```
    rclone lsd "$RCLONE_DRIVE":
    ```

## Step 3: Prepare Teslamate Backup Script
In the same privileged shell session:

1. Create a directory for backups:
    
    ```
    mkdir /home/USER/tmbackup
    cd /home/USER/tmbackup
    ```
    
2. Confirm the name of the Teslamate database container:
    ```
    docker ps | grep teslamate
    ```

3. Install the PostgreSQL client within the Docker container:

    ```
    docker exec -it -u root teslamate-database-1 apt-get update
    docker exec -it -u root teslamate-database-1 apt-get install postgresql-client
    ```
    
4. Create a backup script:
    
    ```
    nano tmbackup.sh
    ```
    
4. Add the following content to the script:
    
    ```bash=
    #!/bin/bash
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    now=$(date +"%A")
    cd /home/USER/tmbackup
    docker exec -it teslamate-database-1 pg_dump -U teslamate teslamate > /home/USER/tmbackup/teslamate.bck_${now}
    rclone copy --max-age 24h /home/USER/tmbackup --include 'teslamate.*' gdrive:Teslamate
    ```

What the script does is:
- Set the PATH: The script sets the PATH environment variable to include standard binary directories.
- Get current day: It assigns the current day of the week to the variable now using the date command.
- Change directory: It changes the current directory to desired backup directory `/home/USER/tmbackup`.
- Backup database: This command is used to create a backup of a PostgreSQL database running inside a Docker container. Here's what each part of the command does:
    - **docker exec -it teslamate-database-1**: This part runs a command inside the running Docker container named `teslamate-database-1`. The `-it` flag allows you to interact with the command (stdin is kept open).
    - **pg_dump -U teslamate teslamate**: This command uses the `pg_dump` tool to create a backup of the teslamate PostgreSQL database. The ` -U teslamate` option specifies the user (teslamate) to connect as.
    - **> /home/USER/tmbackup/teslamate.bck_${now}**: This redirects the output of the `pg_dump` command (which is the database backup) to a file located in the `/home/User/tmbackup/` directory. The file is named `teslamate.bck_<current_day>`, where `<current_day>` is replaced by the current day of the week (thanks to the `${now}` variable).

    Effectively, this command creates a backup file of the teslamate database and saves it with a name that includes the current day, helping you keep track of daily backups.
- Copy to Google Drive: It uses `rclone` to copy the backup files created in the last 24 hours (--max-age 24h) from the `/home/USER/tmbackup` directory to the `gdrive:Teslamate` location on Google Drive.
    

5. Make the script executable:
    
    ```
    chmod +x tmbackup.sh
    ```
    
6. Test the script:
    
    ```
    ./tmbackup.sh
    ```
    
    Verify the backup file is successfully created in `/home/USER/tmbackup` and uploaded to Google Drive.
    

## Step 4: Automate Backups with Cron

1. Edit the root crontab:
    
    ```
    crontab -e
    ```
    
2. Add the following line to schedule the backup at 3:00 AM daily (or whenever you feel like):
    
    ```
    0 3 * * * /home/USER/tmbackup/tmbackup.sh
    ```
    
3. Save and exit the crontab editor.
    

## Step 5: Verify Automation

- Test the cron job by temporarily scheduling it for the next minute.
- Check your backup folder and Google Drive to confirm the backups are running as expected.
    
## Conclusion

By following these steps, you have successfully automated the backup of TeslaMate data to Google Drive. This ensures your data is secure and easily accessible in case of system failures. Happy tracking!

## Thanks
- Adrian Kumpf and all the maintainers of [Teslamate](https://github.com/teslamate-org/teslamate).
- pvo_dave and [TeslaEV](https://www.teslaev.co.uk/) UK for their comprehensive [blog post](https://www.teslaev.co.uk/how-to-perform-an-automatic-teslamate-backup-to-google-drive/) which I used as a reference for this.