import * as React from "react";
import axios from "axios";
import styles from "./Leaves.module.scss";
import { ILeavesProps } from "./ILeavesProps";

export interface IEmpLeavesState {
  isLoading: boolean;
  items: Array<{
    key: number;
    Title: string;
    Approved: string;
    LeaveType: string;
    NoOfDays: string;
    FromDate: string;
    ToDate: string;
    PictureUrl?: string;
    DisplayName?: string;
  }>;
}

export default class EmpLeaves extends React.Component<
  ILeavesProps,
  IEmpLeavesState
> {
  public constructor(props: ILeavesProps, state: IEmpLeavesState) {
    super(props);
    this.state = {
      isLoading: true,
      items: [
        {
          key: 0,
          Title: "",
          Approved: "",
          LeaveType: "",
          NoOfDays: "",
          FromDate: "",
          ToDate: "",
        },
      ],
    };
  }

  public async componentDidMount() {
    await this.getData();
  }

  public async getData() {
    const siteUrl = "https://tuliptechcom.sharepoint.com/sites/HumanResourceHR";
    const url = `${siteUrl}/_api/Web/Lists/getbytitle('LeavesData')/Items?$select=*,Author/Name,Author/Title&$expand=Author`;

    console.log(url);

    try {
      const res = await axios.get(url);
      console.log(res);

      if (res.data.value != undefined && res.data.value != null) {
        const items = res.data.value.map((item: any) => ({
          ...item,
          PictureUrl: `${siteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${encodeURIComponent(
            item.Author.Name
          )}`,
          DisplayName: item.Author.Title,
        }));
        this.setState({ items, isLoading: false });
      }
    } catch (error) {
      console.log(error);
    }
  }

  public render(): React.ReactElement<ILeavesProps> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7);

    const approvedLeaves = this.state.items.filter((item) => {
      const leaveStart = new Date(item.FromDate);
      const leaveEnd = new Date(item.ToDate);
      const leaveSpansCurrentWeek = leaveStart <= endOfWeek && leaveEnd >= startOfWeek;
      const leaveSpansPreviousWeek = leaveStart < startOfWeek && leaveEnd >= startOfWeek;

      const now = new Date();
      const isNextWeek = leaveStart >= startOfWeek && leaveStart <= endOfWeek && leaveEnd > endOfWeek;
      const isCurrentWeek = leaveSpansCurrentWeek || leaveSpansPreviousWeek;

      return (
        item.Approved === "Approved" &&
        (isCurrentWeek || (isNextWeek && now.getDay() === 0))
      );
    });


    return approvedLeaves.length === 0 ? (
      <div>
        Hurray! Everyone is Available this week!
      </div>
    ) : (
      <div className={styles.scrollableContainer}>
        {approvedLeaves.map((item, index) => (
          <div key={index}>
            <div className={styles.boxShdow}>
              <img className={styles.userProfile} src={item.PictureUrl} alt={item.DisplayName} />
              <div className={styles.mainContentDiv}>
                <div className={styles.displayName}>{item.DisplayName}</div>
                <div className={styles.LeaveType}>{item.LeaveType}</div>
                <div className={styles.leaveDateDiv}>
                  <div>{new Date(item.FromDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} - </div>
                  <div>{new Date(item.ToDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

  }
}
