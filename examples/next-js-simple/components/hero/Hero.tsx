import { Builder, withChildren  } from '@builder.io/react';

export const TestCustomComponent = (props:any) => {
  
  return (
    <>
    <div {...props}>
      <h2>{props.inputVal}</h2>
      <>
        {props.list.map((item: any, index: any) => {
          return <div key={item.number+index}>{item.reviewText}</div>
        })}
      </>
    </div>
    <div>{props.children}</div>
    </>
  )
 };



Builder.registerComponent(TestCustomComponent, {
  name: 'Test Custom Comp & 👍 ',
  inputs: [
    {
      name: 'inputVal',
      type: 'text',
      defaultValue: 'this is some text',
      localized: false,
      // regex: {
      //   pattern: "^\/[a-z]$",
      //   // flags for the RegExp constructor; for example, "gi"  */
      //   options: "g",
      //   // message to display to end-users if the regex fails
      //   message: "You must use a relative url starting with '/...' "
      // },
      onChange: (options: any) => {
        console.log('KAHSDFKHASDKFHAKSDHFALKSHD: ', options)

      }
    },
    {
        name: "state",
        type: "text",
        enum: ["CA", "NY", "IL"],
        defaultValue: "CA",
        required: true,
        onChange: (options: any) => {
            options.set('city', "San Francisco")
            console.log(options)
        }
    },
    {
        name: "city",
        type: "text",
        enum: [
            "San Francisco",
            "Palo Alto",
        "New York City",
            "Albany",
        "Chicago"
       ],
       showIf: (options) => {
        return options.get('state') === 'CA'
       },
       defaultValue: "San Francisco",
    },
    {
      name: 'list',
      type: 'list',
      defaultValue: [{ 
        defaultText:  'default text of this thing'
      }],
      copyOnAdd: false,
      subFields: [
        {
          name: 'reviewText',
          type: 'string',
          defaultValue: '"You guys are the best"'
        },
        {
          name: 'number',
          type: 'string',
          required: true,
          defaultValue: '1',
          // onChange: (options: any) => {
          //   console.log('KAHSDFKHASDKFHAKSDHFALKSHD: ')
          // },
          regex: {
            // pattern to test, like "^\/[a-z]$" 
            pattern: "^[1-9]?[0-9]{1}$|^100$",
            // flags for the RegExp constructor, e.g. "gi"  */
            options: "g",
            // message to display to end-users if the regex fails
            message: "must use a number between 1 and 10 "
          }
        },
        {
          name: 'reviewAuthor',
          type: 'string',
          defaultValue: 'Jane Smith',
        },
      ],
      onChange: (options: any) => {
        console.log('OPTIONS NUMBER: ', options.get('number'))
        options.get('list').forEach((item: any) => console.log(item._data.get('number')))
        console.log('OPTIONS subfields: ', options.get('list'))

        if (options.get('list').length > 4) {
          console.log('in on change isError');
          options.set('list', options.get('list').slice(0, 4))
        }
      }
    }
  ]
});

