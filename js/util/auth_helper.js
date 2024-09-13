export class UserReasons {
    static VAILD = 0
    static OVERDUE = 1
    static BANNED = 2
    static TEMPBANNED = 3
    static EMAIL_NOT_VERIFIED = 4
    static OTHER = 99
}

export const VERIFIED_SCHOOL_EMAILS = ["libertyunion.org"];

export function isUserVaild(user, udata) {
    if (user == null || udata == "" || udata == "UNKNOWN") {
        return {reason: UserReasons.OTHER};
    }
    if (udata.banned != undefined) {
        const endsOn = udata.banned.endsOn;
        const perm = endsOn == undefined || endsOn == null;
        if (perm) {
            return { reason: UserReasons.BANNED, banReason: udata.banned.reason };
        }
        const date = endsOn.seconds * 1000;
        var createdAt = (new Date(date).getTime());
        let difference = Math.floor((createdAt - Date.now()));
        if (difference > 0) {
            return { reason: UserReasons.TEMPBANNED, banReason: udata.banned.reason, endsOn };
        }
    }
    var time = (Date.parse(udata.creation) - new Date()); // milliseconds between now & user creation
    var diffDays = -Math.floor(time / 86400000); // days
    if (user.emailVerified == true || VERIFIED_SCHOOL_EMAILS.includes(user.email.split("@")[1]) == false) {
        if (diffDays > 30) {
            return { reason: UserReasons.OVERDUE };
        }
    }
    if (user.emailVerified == false && !user.email.includes("@libertyunion.org")) {
        return { reason: UserReasons.EMAIL_NOT_VERIFIED };
    }

    return {reason: UserReasons.VAILD};
}