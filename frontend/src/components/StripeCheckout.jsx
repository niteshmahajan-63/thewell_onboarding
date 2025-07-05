import { Button } from './ui/button'

const StripeCheckout = ({ onNext }) => {
    return (
        <div className="text-center py-16">
            <Button onClick={onNext}>Next Step</Button>
        </div>
    )
}

export default StripeCheckout
