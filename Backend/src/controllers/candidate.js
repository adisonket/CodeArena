import User from "../models/User.js";
import InterviewResult from "../models/InterviewResult.js";

export const getAllCandidates = async (req, res) => {
  try {

    const users = await User.find().lean();

    const candidates = await Promise.all(
      users.map(async (user) => {

        // fetch all interview results
        const results = await InterviewResult
          .find({ userId: user._id })
          .populate("driveId");

        // latest interview result
        const latestResult = results.sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        let avgScore = 0;
        let completionRate = 0;
        let drive = "Not Attempted";
        let status = "Active";

        // if candidate has attempted any drive
        if (latestResult) {

          // average score across all drives
          avgScore = Math.round(
            results.reduce(
              (sum, r) => sum + (r.score || 0),
              0
            ) / results.length
          );

          // latest drive name
          drive =
            latestResult.driveId?.hiringPositionName ||
            "Drive Not Found";

          // completion percentage of latest drive
          completionRate =
            latestResult.driveId?.totalMarks > 0
              ? Math.round(
                  (
                    latestResult.score /
                    latestResult.driveId.totalMarks
                  ) * 100
                )
              : 0;

          // latest status
          status =
            latestResult.status === "Completed"
              ? "Completed"
              : "On-Hold";
        }

        return {
          ...user,

          avgScore,
          completionRate,
          drive,
          status,

          totalDrives: results.length,

          latestScore: latestResult?.score || 0,

          latestDriveDate:
            latestResult?.createdAt || null,

          drives: results.map((r) => ({
            id: r.driveId?._id,

            name:
              r.driveId?.hiringPositionName ||
              "Drive Not Found",

            score: r.score,

            status: r.status,

            date: r.createdAt,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      candidates,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
    });
  }
};

export const getCandidateById = async (req, res) => {
  try {

    const candidate = await User.findById(
      req.params.id
    );

    if (!candidate) {

      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // fetch all results
    const results = await InterviewResult
      .find({ userId: candidate._id })
      .populate("driveId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      candidate,
      results,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate",
    });
  }
};