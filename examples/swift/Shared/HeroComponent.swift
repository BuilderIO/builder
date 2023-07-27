import SwiftUI
import BuilderIO

struct HeroComponent: View {
    
    var headingText: String;
    var ctaText: String;
    
    var body: some View {
        Text(headingText)
            .font(.system(size: 25).weight(Font.Weight.heavy))
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, alignment: .center)
            .foregroundColor(.black)
            .background(RoundedRectangle(cornerRadius: 10).fill(.white));
        
        Button(action: {
            print("Button tapped");
        }, label: {
            Text(ctaText)
                .font(.system(size: 12).weight(Font.Weight.medium))
                .foregroundColor(.white)
                .padding(10)
                
        })
        // rgb(74, 144, 226)
        .foregroundColor(.white)
        //.buttonStyle(.borderedProminent)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color(red: 74 / 255, green: 144 / 255, blue: 226 / 255, opacity: 1)))
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity, alignment: .center)
        
    }
}

struct HeroComponent_Previews: PreviewProvider {
    static var previews: some View {
        HeroComponent(headingText: "Default Heading", ctaText: "Default CTA Text")
    }
}
