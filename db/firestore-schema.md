# Firestore Schema

users/{uid}: {uid, email, displayName, bio, age, birthdate, city, gender, photos[], interests[], preferences{ageMin,ageMax,maxDistance,gender}, isVisible, isVerified, isAdmin, createdAt, lastActive}
users/{uid}/photos/{id}: {url, position, approved}
matches/{matchId}: {userIds[2], createdAt, updatedAt, lastMessage}
matches/{matchId}/messages/{msgId}: {senderId, text, createdAt}
notifications/{userId}/items/{id}: {userId, type, text, read, ts}
news/{articleId}: {title, excerpt, body, category, publishedAt, tags[]}
jobs/{jobId}: {title, company, city, contract, salary, tags[], status, publisherId, publishedAt}
jobs/{jobId}/applications/{id}: {applicantId, cover, status, createdAt}
reports/{id}: {reporterId, type, target, reason, status, createdAt}
audit/{id}: {ts, action, target, detail}
