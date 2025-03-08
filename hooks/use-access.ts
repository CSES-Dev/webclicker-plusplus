import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { validateUser } from "@/services/userCourse";

const useAccess = ({ courseId, role }: { courseId: number; role: Role }) => {
    const session = useSession();

    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const checkAccess = async () => {
            if (!session.data?.user.id) {
                setHasAccess(false);
                setIsLoading(false);
            } else {
                setHasAccess((await validateUser(session.data?.user.id, courseId, role)) ?? false);
                setIsLoading(false);
            }
        };
        void checkAccess();
    }, [courseId, role]);

    return { hasAccess, isLoading };
};

export default useAccess;
