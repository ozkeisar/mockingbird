import { Button, Typography } from "@mui/material";
import React from "react";
import styles from './errorBoundary.module.css';
import { ReactComponent as LogoIcon } from './../../../../assets/icon.svg'; 
import { reportButtonClick } from "../../utils";
import { BUTTONS } from "../../../consts/analytics";

type MyProps = {
  // using `interface` is also ok
  onReload: ()=>void;
  children: React.ReactNode
};
type MyState = {
  hasError: boolean; 
};


export class ErrorBoundary extends React.Component<MyProps, MyState> {
    constructor(props: {children: React.ReactNode}) {
      super(props as any);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError() {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }

    componentDidCatch(error:any, errorInfo: any) {
      console.log('Error: ', {error, errorInfo})
      // You can also log the error to an error reporting service
    }
  

  
    render() {

      if (this.state.hasError) {
        // You can render any custom fallback UI
        return (
            <div className={styles.container}>
                <LogoIcon width={80}></LogoIcon>
                <Typography>Something went wrong!</Typography>
                <Button onClick={()=>{
                  reportButtonClick(BUTTONS.ERROR_BOUNDARY_RELOAD)
                  this.props.onReload()
                  this.setState({hasError: false})
                }}>Reload</Button>
            </div>
        )
      }
  
      return this.props.children;
    }
  }
