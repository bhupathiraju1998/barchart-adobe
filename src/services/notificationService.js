// Notification service for Charts Pro
// This will handle notifications and user tracking

export const sendDirectNotification = async (userId, webhookUrl) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `🎉 New user activated Charts Pro! User ID: ${userId}`,
                username: 'Charts Pro Bot',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/2782/2782068.png'
            }),
        });

        if (response.ok) {
            console.log('Notification sent successfully');
        } else {
            console.error('Failed to send notification:', response.status);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};



