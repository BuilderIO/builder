import * as React from 'react';
import Loadable from 'react-loadable';

// TODO: wrap in div positoin: relative padding: 50, width: 100%, height: 100% display: flex
const Loading = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
    <img
      style={{ margin: '100px auto', width: 30, height: 30 }}
      src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0ea05b817e7040c39ec81987611542d7"
    />
  </div>
);

// TODO
// export const asyncComponent = tb<T extends object = any>(
//   fn: () => Promise<React.ComponentType<T>>,
//   showLoading = true
// ) =>
//   Loadable({
//     loader: async () => {
//       try {
//         return fn()
//       } catch (error) {
//         console.error('Could not load chunk, probably because of deploy, reloading', error)
//         setTimeout(reload)
//         return Loading
//       }
//     },
//     loading: props => {
//       if (props.error) {
//         console.error(props.error)

//         return (
//           <div style={{ textAlign: 'center', padding: 10 }}>
//             Oops! We had a problem loading this content, try{' '}
//             <a
//               css={{
//                 cursor: 'pointer',
//                 color: 'steelblue'
//               }}
//               onClick={reload}
//             >
//               reloading
//             </a>{' '}
//             this page
//           </div>
//         )
//       }

//       if (showLoading) {
//         return <Loading />
//       }

//       return null
//     }
//   })

function reload(): any {
  location.reload(true);
}
