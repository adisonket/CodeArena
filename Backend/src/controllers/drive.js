import Drive from "../models/Drive.js";
import User from "../models/User.js";
import InterviewResult from "../models/InterviewResult.js";
import Interview from "../models/Interview.js";

export const getAllDrives = async (req, res) => {

    try {

        const drives = await Drive.find()
            .sort({ createdAt: -1 })
            .lean();

        const formattedDrives = await Promise.all(

            drives.map(async (drive) => {

                const results = await InterviewResult.find({
                    driveId: drive._id,
                });

                const totalCandidates = results.length;

                const attempted = results.filter(
                    (r) => r.status === "Completed"
                ).length;

                const avgScore =
                    results.length > 0
                        ? Math.round(
                              results.reduce(
                                  (sum, r) => sum + (r.score || 0),
                                  0
                              ) / results.length
                          )
                        : 0;

                const topScore =
                    results.length > 0
                        ? Math.max(
                              ...results.map((r) => r.score || 0)
                          )
                        : 0;

                const completionRate =
                    totalCandidates > 0
                        ? Math.round(
                              (attempted / totalCandidates) * 100
                          )
                        : 0;

                        const now = new Date();

                        const driveDate = new Date(
                            drive.driveDate
                        );
                        
                        let status = "Draft";
                        
                        if (driveDate >= now) {
                        
                            status = "Active";
                        
                        }
                        
                        if (
                            driveDate < now &&
                            totalCandidates > 0
                        ) {
                        
                            status = "Completed";
                        
                        }

                        const interview = await Interview.findOne({
                            driveId: drive._id,
                        });
                        
                        const assignedCount =
                            interview?.userIds?.length || 0;
                        
                        return {
                        
                            _id: drive._id,
                        
                            title: drive.hiringPositionName,
                        
                            tag: drive.driveType,
                        
                            status,
                        
                            visibility:
                                assignedCount > 0
                                    ? "Public"
                                    : "Private",
                        
                            startDate: drive.driveDate,
                        
                            endDate: drive.driveDate,
                        
                            totalCandidates,
                        
                            attempted,
                        
                            avgScore,
                        
                            topScore,
                        
                            duration: drive.timeDurationInMin,
                        
                            questionCount:
                                drive.mcqCount + drive.codeCount,
                        
                            mcqCount: drive.mcqCount,
                        
                            codeCount: drive.codeCount,
                        
                            marksPerMcq: drive.mcqMarks,
                        
                            marksPerCode: drive.codeMarks,
                        
                            type: drive.driveType,
                        
                            createdAt: drive.createdAt,
                        
                            difficulty: "Medium",
                        
                            tags: [],
                        
                            completionRate,
                        };
            })
        );

        res.status(200).json({
            success: true,
            drives: formattedDrives,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch drives",
        });
    }
};

export const createDrive = async (req, res) => {

    try {

        const drive = await Drive.create(req.body);

        res.status(201).json({

            success: true,

            drive,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to create drive",
        });
    }
};

export const getDriveCandidates = async (req, res) => {

    try {

        const { id } = req.params;

        // FIND INTERVIEW ASSIGNMENT
        const interview =
            await Interview.findOne({
                driveId: id,
            })

            .populate(
                "userIds",
                "firstName lastName email picture profilePhoto"
            )

            .populate("driveId");

        // NO INTERVIEW FOUND
        if (!interview) {

            return res.status(200).json({

                success: true,

                candidates: [],
            });
        }

        // GET RESULTS
        const results =
            await InterviewResult.find({
                driveId: id,
            });

        // FORMAT USERS
        const candidates =
            interview.userIds.map((u) => {

                // FIND RESULT
                const result =
                    results.find(
                        (r) =>
                            r.userId?._id?.toString() ===
                            u._id.toString()
                    );

                return {

                    _id: u._id,

                    firstName:
                        u.firstName || "",

                    lastName:
                        u.lastName || "",

                    email:
                        u.email || "",

                    picture:
                        u.picture ||
                        u.profilePhoto ||
                        "",

                    score:
                        result?.score ?? null,

                    status:
                        result?.status ||
                        "Assigned",
                };
            });

        res.status(200).json({

            success: true,

            candidates,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch candidates",
        });
    }
};

export const assignCandidatesToDrive = async (req, res) => {

    try {

        const { candidateIds } = req.body;

        let interview = await Interview.findOne({
            driveId: req.params.id,
        });

        // CREATE INTERVIEW IF NOT EXISTS
        if (!interview) {

            interview = await Interview.create({
                driveId: req.params.id,
                userIds: candidateIds,
            });

        } else {

            const existingIds =
                interview.userIds.map((id) =>
                    id.toString()
                );

            const merged = [
                ...new Set([
                    ...existingIds,
                    ...candidateIds,
                ]),
            ];

            interview.userIds = merged;

            await interview.save();
        }

        res.status(200).json({

            success: true,

            message:
                "Candidates assigned successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to assign candidates",
        });
    }
};

export const getAllCandidates = async (req, res) => {

    try {

        const candidates = await User.find({
            role: "candidate",
        }).select(
            "firstName lastName email picture profilePhoto"
        );

        res.status(200).json(candidates);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                "Failed to fetch candidates",
        });
    }
};

export const deleteDrive = async (req, res) => {

    try {

        const drive = await Drive.findByIdAndDelete(
            req.params.id
        );

        if (!drive) {

            return res.status(404).json({
                success: false,
                message: "Drive not found",
            });
        }

        res.json({
            success: true,
            message: "Drive deleted successfully",
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};