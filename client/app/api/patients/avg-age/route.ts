import { UserRole } from "@/lib/auth-types";
import { handleRouteError, sendAuthorizedTcpMessage } from "@/lib/server-session";

export async function GET(request: Request) {
    try {
        const avgAge = await sendAuthorizedTcpMessage(
            request,
            { cmd: "get_average_age" },
            {},
            [UserRole.ADMIN],
            'patients',
        );

        return Response.json({ avgAge });
    } catch (error) {
        return handleRouteError(error);
    }
}
