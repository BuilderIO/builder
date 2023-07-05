import * as React from 'react'

export interface TextProps {
  text: string
}

async function CatFacts(props: TextProps) {
  const catFacts = await fetch('https://cat-fact.herokuapp.com/facts').then(
    (x) => x.json()
  )
  console.log('logging in catfacts')
  return (
    <div>
      Here are some cat facts:
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {catFacts.map((fact) => (
          <span
            className="builder-text"
            style={{
              outline: 'none',
            }}
            key={fact._id}
          >
            {fact.text}
          </span>
        ))}
      </div>
    </div>
  )
}

export default CatFacts
